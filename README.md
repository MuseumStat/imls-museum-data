# IMLS Museum Data

[![Build Status](https://travis-ci.org/azavea/imls-museum-data.svg?branch=develop)](https://travis-ci.org/azavea/imls-museum-data)

## Development

#### Prerequisites
- nodejs >0.12 and <12 . Node 8 seems to work. You will likely need to install nvm to use an older version of node.
- ruby
- ruby gem package manager

#### Install dependencies

Note: sudo might be required depending on where these tools are installed
```
gem install sass compass
npm install -g bower grunt-cli
npm install
bower install
```

#### Set up ACS API key

First copy the example js config file: `cp app/scripts/config.js.example app/scripts/config.js`

If at Azavea, an API key for use is stored in the company password manager. Otherwise, you'll need to [sign up for a key](http://api.census.gov/data/key_signup.html).

Once you have your key, add it to the appropriate spot at the top of the `app/scripts/config.js` file.

#### Grunt tasks

- `grunt server`: Run the development server, watching for js/css/html changes
- `grunt test`: Run the test suite


## Deploying

First, ensure bower components are up to date:
```
bower install
```

Double-check that `app/scripts/config.js` has the appropriate custom values for the environment being deployed.

Then, build the minified app with:
```
grunt build
```

Copy the environment example file: `cp .env.example .env`

Configure s3_website for deployment by setting the following ENV variables in `.env`:
  - IMLS_ACCESS_KEY
  - IMLS_SECRET_KEY

Once the AWS access keys are set in your environment, deploy the app:
```
s3_website push --force
```

If you want to change the bucket the app deploys to, edit the `s3_bucket` setting in s3_website.yml

If you change the bucket, ensure that you do the following:
  - Add the bucket to the IAM S3-Full-Access policy for the user's access keys
  - Run `s3_bucket cfg apply` to create a new bucket and apply the proper settings. Choose 'N' for 'Would you like to deliver your website via CloudFront'.

#### IAM S3 Full Access Policy

This is a sample. You will need to add additional entries for each `<bucket_name>` you manage with
the IAM user that uses this policy.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::<bucket_name>",
                "arn:aws:s3:::<bucket_name>/*"
            ]
        }
    ]
}
```
