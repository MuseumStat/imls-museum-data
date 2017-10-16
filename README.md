# ImpactView Philly

[![Build Status](https://travis-ci.org/ImpactView/impact-view-philly.svg?branch=develop)](https://travis-ci.org/ImpactView/impact-view-philly)

## Development

#### Prerequisites
- nodejs 6+
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

- `grunt serve`: Run the development server, watching for js/css/html changes
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
  - IVP_ACCESS_KEY
  - IVP_SECRET_KEY

The user deploying the application must have write access to the S3 buckets that this site deploys to.
See [IAM S3 Full Access Policy](#IAM-S3-Full-Access-Policy) below.

Once the AWS access keys are set in your environment, deploy the app:

```
# staging
./scripts/infra staging

# production
./scripts/infra production
```

### Creating a new site

To create an environment, perform the following steps.

1. Create new s3_website.yml template with `s3_website cfg create`

2. Copy config to `./config/<environment>/s3_website.yml`, then update it as desired. Ensure you update the value for `s3_bucket` at least, along with the CNAME value in the cloudfront aliases section.

3. Create the S3 buckets along with a CloudFront distribution for each by running:

```
s3_website cfg apply --config-dir="config/<environment>" --autocreate-cloudfront-dist
```

4. Once the CloudFront distribution has the "Deployed" status, go to CloudFront -> Distribution Settings -> Behaviors and create a new behavior for path `*` that redirects HTTP to HTTPS.

5. Open Route53 and add a CNAME alias for the domain you're setting up, pointing to the CloudFront distribution you just created with s3_website

6. Create a new SSL cert for your environment via AWS Certificate Manager. Wait for the email, then approve it.

7. Go to CloudFront -> Distribution Settings -> Edit -> SSL Certificate and select "Custom SSL Certificate". Choose the cert you just approved from the dropdown, then Save the changes on the page.

Once the Route53 and CloudFront changes have had a chance to take effect, you'll be able to hit your new domain and see the site served via HTTPS!

Repeat for each environment. This project was initialized by performing these steps for the environments:
- `staging=staging.impactview.org`
- `production=impactview.org`

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
