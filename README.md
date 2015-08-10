# imls-museum-data

https://travis-ci.org/azavea/imls-museum-data.svg?branch=develop

IMLS Museum Data

## Deploying

First, ensure bower components are up to date:
```
bower install
```

Then, build the minified app with:
```
grunt build
```

Configure s3_website for deployment by setting the following ENV variables:
  - IMLS_ACCESS_KEY
  - IMLS_SECRET_KEY

Once the AWS access keys are set in your environment, deploy the app:
```
s3_website push --force
```

If you want to change the bucket the app deploys to, edit the `s3_bucket` setting in s3_website.yml

If you change the bucket, ensure that you do the following:
  - Add the bucket to the IAM S3-Full-Access policy for the user's access keys
  - Configure the bucket for static hosting, with both the index and error pages pointing to `index.html`
  - Under bucket settings, set the bucket policy via `Edit Bucket Policy` to:
```
{
    "Version": "2008-10-17",
    "Statement": [
        {
            "Sid": "PublicReadForGetBucketObjects",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<bucket_name>/*"
        }
    ]
}
```