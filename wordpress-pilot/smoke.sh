#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
export COMPOSE_PROJECT_NAME="11run-pilot-check-$$"
export PILOT_DB_PASSWORD="$(openssl rand -hex 20)"
export PILOT_ACCESS_PASSWORD="$(openssl rand -hex 20)"
stage=build
trap 'result=$?; if (( result )); then printf "Falha na fase: %s\n" "$stage" >&2; docker compose ps; fi; docker compose down -v' EXIT
docker compose up -d --build --wait

site=http://127.0.0.1/global
status() { curl -s --max-time 4 -o /dev/null -w '%{http_code}' "$@" || true; }
wp() { docker compose exec -T wordpress wp --allow-root --url="$site" "$@"; }
auth=(--user "previa:$PILOT_ACCESS_PASSWORD")

stage=private-before-setup
for attempt in {1..40}; do
    [[ "$(status "$site/")" == 401 ]] && break
    sleep 2
done
[[ "$(status "$site/")" == 401 ]]
[[ "$(status "$site/wp-login.php")" == 401 ]]
[[ "$(status http://127.0.0.1/)" == 403 ]]
[[ "$(status "${auth[@]}" "$site/wp-config.php")" == 403 ]]

# The real installer is used at deployment; this disposable CI site creates a test user.
stage=wordpress-installation
wp core install --url="$site" --title=11RUN --admin_user=pilot \
    --admin_password="$(openssl rand -hex 20)" --admin_email=pilot@example.test --skip-email
wp plugin install elementor --version=4.4.1 --activate
wp --user=pilot 11run-pilot seed
wp --user=pilot 11run-pilot seed
wp plugin is-active elementor
wp plugin verify-checksums elementor

stage=home-html
html="$(curl -fsS "${auth[@]}" "$site/")"
[[ "$html" == *pilot-hero* && "$html" == *pilot-nav-mobile* && "$html" == *"11RUN · Fundismo no Brasil"* ]]
[[ "$html" == *'https://11run.com.br/politica-de-privacidade'* ]]
[[ "$html" == *'/global/wp-content/'* ]]
stage=editable-home
page="$(wp option get page_on_front)"
meta="$(wp post meta get "$page" _elementor_data)"
[[ "$meta" == *time-2027.webp* && "$meta" == *background_position_mobile* ]]
[[ "$(wp post list --post_type=page --name=home-11run --format=count)" == 1 ]]
[[ "$(wp option get blog_public)" == 0 ]]

stage=media
image="$(wp post list --post_type=attachment --post_status=inherit --meta_key=_11run_pilot_asset --meta_value=time-2027.webp --field=guid)"
[[ "$image" == "$site"/wp-content/uploads/*.webp ]]
[[ "$(status "$image")" == 401 ]]
[[ "$(status "${auth[@]}" "$image")" == 200 ]]
stage=rest
[[ "$(status "${auth[@]}" "$site/wp-json/")" == 200 ]]
stage=headers
headers="$(curl -fsSI "${auth[@]}" "$site/")"
grep -qi '^x-robots-tag: noindex' <<< "$headers"
grep -qi '^cache-control: private, no-store' <<< "$headers"

stage=editorial-import
wp --user=pilot eval 'echo wp_json_encode(onze_migration_batch(0));' | grep -q '"created":2'
wp --user=pilot eval 'echo wp_json_encode(onze_migration_batch(0));' | grep -q '"created":0'
editorial="$(curl -fsS "${auth[@]}" "$site/institucional/missao/")"
[[ "$editorial" == *"Valores 11RUN"* && "$editorial" == *onze-primary-links* && "$editorial" == *onze-footer-links* ]]
registration="$(curl -fsS "${auth[@]}" "$site/cadastros/")"
[[ "$registration" == *data-onze-registration* && "$registration" == *portal.js* ]]
stage=registration-privacy
[[ "$(status "${auth[@]}" "$site/wp-json/wp/v2/onze_cadastro")" == 404 ]]
[[ "$(status "${auth[@]}" -d 'action=onze_register' "$site/wp-admin/admin-post.php")" == 403 ]]
printf 'WordPress, Elementor, home, mídia, autenticação e rota /global validados.\n'
