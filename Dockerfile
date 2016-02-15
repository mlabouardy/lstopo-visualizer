FROM  mlabouardy/apache
MAINTAINER mlabouardy <mohamed@labouardy.com>

# Copy app
COPY . /var/www/html/ped

# Bundle app source
COPY . /src

EXPOSE  80
