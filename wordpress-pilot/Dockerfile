FROM wordpress:cli AS cli
FROM wordpress:php8.3-apache

COPY --from=cli /usr/local/bin/wp /usr/local/bin/wp
COPY wordpress-pilot/theme/ /opt/11run-pilot/theme/
COPY wordpress-pilot/seed-home.php wordpress-pilot/entrypoint.sh /opt/11run-pilot/
COPY wordpress-pilot/global.conf /etc/apache2/conf-available/11run-global.conf
COPY wordpress-pilot/php.ini /usr/local/etc/php/conf.d/11run-pilot.ini
COPY public/assets/home/time-2027.webp public/assets/logos/onzerun-menu.png /opt/11run-pilot/media/

RUN a2enmod headers rewrite && a2enconf 11run-global \
    && php -l /opt/11run-pilot/seed-home.php \
    && php -l /opt/11run-pilot/theme/functions.php \
    && php -l /opt/11run-pilot/theme/index.php \
    && bash -n /opt/11run-pilot/entrypoint.sh \
    && apache2ctl configtest

ENTRYPOINT ["bash", "/opt/11run-pilot/entrypoint.sh"]
CMD ["apache2-foreground"]
