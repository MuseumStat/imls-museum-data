## Populate CartoDB table with Factual Social Media IDs

`load_factual_data.py` is used to update a cartodb table with social media links for each museum
in the table.


### Install dependencies

Install dependencies via pip:
```
pip install -r requirements.txt
```
We recommend installing into a python virtualenv: http://docs.python-guide.org/en/latest/dev/virtualenvs/


### Script configuration

Before configuring, you will need:
  - CartoDB API Access Key, retrieved from the "Your API Keys" section of your account
  - Factual API Oauth Key/Secret: https://www.factual.com/contact#free_api_access

Once you have your access keys, copy the yaml config:
```
cp config.yaml.template config.yaml
```
and enter your CartoDB account/table name and API keys into the appropriate fields


### Notes on Factual API limits

The Factual API limits verified users to 10,000 request per day, so the script provides `--limit`
and `--offset` options so that the script can be run multiple times to populate the entire table
if it is larger than the API limits.

The default script options for `--offset` and `--limit` only populate the first ten rows of the
cartodb table, to avoid accidentally running a user with a free unverified Factual API account
out of their daily limit (only 100 rows).
