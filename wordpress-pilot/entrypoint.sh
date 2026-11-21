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
install -m 0644 -o www-data -g www-data /opt/11run-pilot/seed-home.php /var/www/html/wp-content/mu-plugins/11run-pilot.php
install -m 0644 -o www-data -g www-data /opt/11run-pilot/migration/import.php /var/www/html/wp-content/mu-plugins/11run-migration.php
install -d -o www-data -g www-data /var/www/html/wp-content/mu-plugins/11run-migration
install -m 0644 -o www-data -g www-data /opt/11run-pilot/migration/{modules.php,portal.js} /var/www/html/wp-content/mu-plugins/11run-migration/
install -m 0644 -o www-data -g www-data /opt/11run-pilot/generated/legacy.css /var/www/html/wp-content/mu-plugins/11run-migration/
exec docker-entrypoint.sh "$@"
