#!/usr/bin/env bash
set -euo pipefail

access_password=${PILOT_ACCESS_PASSWORD:-}
if [[ ! "$access_password" =~ ^[0-9A-Za-z]{24,64}$ ]]; then
    printf 'Configure PILOT_ACCESS_PASSWORD (24–64 caracteres alfanuméricos).\n' >&2
    exit 1
fi
printf '%s\n' "$access_password" | htpasswd -i -B -c /run/11run-pilot.htpasswd previa >/dev/null
chown root:www-data /run/11run-pilot.htpasswd
chmod 640 /run/11run-pilot.htpasswd
unset access_password PILOT_ACCESS_PASSWORD

install -d -o www-data -g www-data /var/www/html/wp-content/{mu-plugins,plugins,themes}
cp -a /opt/11run-pilot/theme/. /var/www/html/wp-content/themes/onze-piloto/
cp -a /opt/11run-pilot/theme/. /var/www/html/wp-content/themes/onze-portal/
install -m 0644 -o www-data -g www-data /opt/11run-pilot/seed-home.php /var/www/html/wp-content/mu-plugins/11run-pilot.php
plugin=/var/www/html/wp-content/plugins/11run-migration
install -d -o www-data -g www-data "$plugin/generated"
install -m 0644 -o www-data -g www-data /opt/11run-pilot/migration/{import.php,modules.php,portal.js} /opt/11run-pilot/generated/legacy.css "$plugin/"
install -m 0644 -o www-data -g www-data /opt/11run-pilot/generated/content.json "$plugin/generated/"
exec docker-entrypoint.sh "$@"
