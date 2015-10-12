#!/usr/bin/python

import argparse
from copy import deepcopy

from factual import Factual
import requests
import yaml

SQL_API_URL = "https://{cartodb_account}.cartodb.com/api/v2/sql?api_key={key}&q={query}"

# Map the id returned by factual (key) to the cartodb column name (value)
# If your cartodb columns for each of the social media urls are different, modify the values
# in this mapping, e.g. change facebook_id to the appropriate column name in your table
SOCIAL_COLUMNS = {
    'wikipedia': 'wikipedia_url',
    'facebook': 'facebook_url',
    'twitter': 'twitter_url',
    'google_plus': 'google_plus_url',
    'yelp': 'yelp_url',
    'foursquare': 'foursquare_url',
    'pinterest': 'pinterest_url'
}

URLS_TEMPLATE = {
    'wikipedia': '',
    'facebook': '',
    'twitter': '',
    'google_plus': '',
    'yelp': '',
    'foursquare': '',
    'pinterest': ''
}

def get_social_urls(factual_api, factual_id):
    """ Make the factual api call to crosswalk, filtering by factual_id

    Returns a dict of social media key mapped to a url
    """
    urls = deepcopy(URLS_TEMPLATE)

    factual_data = (factual_api.crosswalk()
                    .filters({'factual_id': factual_id})
                    .data())
    for entry in factual_data:
        namespace = entry.get('namespace', None)
        url = entry.get('url', None)
        if urls.get(namespace, None) == '' and url is not None:
            urls[namespace] = url
    return urls


def main():
    """ Update a CartoDB account/table with social media urls retrieved via factual_id column """
    parser = argparse.ArgumentParser(description='Load social media urls via Factual API for ' +
                                                 'each museum with a factual id')
    parser.add_argument('--limit', type=int, default=10, help='Limit the number of records to ' +
                                                              'update at once')
    parser.add_argument('--offset', type=int, default=None, help='Offset the first record to ' +
                                                                 'update')
    args = parser.parse_args()
    limit = args.limit
    offset = args.offset

    # Suppress urllib3 InsecurePlatformWarnings
    requests.packages.urllib3.disable_warnings()

    with file('config.yaml', 'r') as f:
        config = yaml.load(f)

    api = Factual(config['FACTUAL_ACCESS_KEY'], config['FACTUAL_SECRET_KEY'])

    query = """SELECT cartodb_id, mid, factual_id
               FROM {cartodb_table}
               WHERE factual_id is not null AND
                     factual_id <> '' AND
                     factual_id <> ' '
               ORDER BY cartodb_id""".format(cartodb_table=config['CARTODB_TABLE'])
    if limit is not None:
        query += ' LIMIT {0}'.format(limit)
    if offset is not None:
        query += ' OFFSET {0}'.format(offset)

    url = SQL_API_URL.format(cartodb_account=config['CARTODB_ACCOUNT'],
                             key=config['CARTODB_API_KEY'],
                             query=query)
    response = requests.get(url)
    rows = response.json()['rows']
    total_rows = len(rows)

    imports = 0

    try:
        for row in rows:
            social_urls = get_social_urls(api, row['factual_id'])

            update_template = "{column} = '{value}'"
            update = ', '.join([update_template.format(column=SOCIAL_COLUMNS[key],
                                                       value=value)
                                for key, value in social_urls.iteritems()])
            query = """UPDATE {cartodb_table}
                       SET {update}
                       WHERE mid = '{mid}'""".format(cartodb_table=config['CARTODB_TABLE'],
                                                     update=update,
                                                     mid=row['mid'])
            request_url = SQL_API_URL.format(cartodb_account=config['CARTODB_ACCOUNT'],
                                             key=config['CARTODB_API_KEY'],
                                             query=query)
            response = requests.get(request_url)
            if response.status_code == 200:
                imports = imports + 1
            else:
                print "ERROR {mid}: {error}".format(mid=row['mid'], error=response.json()['error'])

            if imports % 100 == 0:
                print "Imported {imports}/{total}".format(imports=imports, total=total_rows)

    except Exception as e:
        print "EXCEPTION: imports = {}".format(imports)
        raise e

    print "Imported {imports}/{total}".format(imports=imports, total=total_rows)

if __name__ == "__main__":
    main()
