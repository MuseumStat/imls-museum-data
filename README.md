# imls-museum-data

https://travis-ci.org/azavea/imls-museum-data.svg?branch=develop

IMLS Museum Data

### Developing

Copy the config.js template and add your Factual API key:
```
cp app/scripts/config.js.template app/scripts/config.js
```

In order to run npm/bower/grunt/compass, you'll need some stuff installed on your machine:
```
npm install -g grunt-cli bower
gem install sass compass
```

Now install development dependencies:
```
npm install && bower install
```

Run development server with grunt serve:
```
grunt serve
```
