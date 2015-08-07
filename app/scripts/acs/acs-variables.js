(function () {
    'use strict';

    // TODO: Move this into a CartoDB table and request asynchronously if we start
    //       modifying these regularly?

    var ACSVariables = {

        /* People Tab */
        // Population -- number
        'B01001_001E':   'Total',

        // Population by Gender -- pie
        'B01001_002E':   'Male',
        'B01001_026E':   'Female',

        // Median Age by Gender -- not sure - bullet?
        'B01002_002E':   'Male',
        'B01002_003E':   'Female',

        // Race -- bar
        'B02001_002E':   'White alone',
        'B02001_003E':   'Black or African American alone',
        'B02001_004E':   'American Indian and Alaska Native alone',
        'B02001_005E':   'Asian alone',
        'B02001_006E':   'Native Hawaiian and Other Pacific Islander alone',
        'B02001_007E':   'Some other race alone',
        'B02001_008E':   'Two or more races',

        // Hispanic -- number (% Hispanic or Latino)
        'B03001_003E':   'Hispanic or Latino',

        // Population Under 18 Years Old -- number
        'B09001_001E':   'Total',

        // Educational Attainment -- bar
        'B15003_001E':   'Total',
        'B15003_017E':   'Regular high school diploma',
        'B15003_018E':   'GED or alternative credential',
        'B15003_019E':   'Some college, less than 1 year',
        'B15003_020E':   'Some college, 1 or more years, no degree',
        'B15003_021E':   'Associate\'s degree',
        'B15003_022E':   'Bachelor\'s degree',
        'B15003_023E':   'Master\'s degree',
        'B15003_024E':   'Professional school degree',
        'B15003_025E':   'Doctorate degree',
        // note: the client requested we "Combine doctoral, master’s, and professional degrees into
        // one category. Include a “Some HS” category for anyone without a HS diploma. Combine
        // “HS Diploma” and “GED” into one category. Reverse the order displayed from lower
        // attainment to higher attainment."

        // Per Capita Income -- number
        'B19301_001E':   'Per capita income in the past 12 months (in 2013 inflation-adjusted dollars)',

        // Employment Status -- column
        'B23025_004E':   'Employed',
        'B23025_005E':   'Unemployed',
        'B23025_006E':   'Armed Forces',
        'B23025_007E':   'Not in labor force',

        // Poverty Status -- number
        'B17001_001E':   'Total People in Poverty',

        /* Households Tab */

        // Total Households -- number
        'B11001_001E':   'Total',

        // Household types -- pie
        'B11001_002E':   'Family households',
        'B11001_007E':   'Nonfamily households',

        // Median Household Income -- number
        'B19013_001E':   'Median household income in the past 12 months (in 2013 inflation-adjusted dollars)',

        // Household Language -- column
        'B16002_002E':   'English only',
        'B16002_003E':   'Spanish',
        'B16002_006E':   'Other Indo-European languages',
        'B16002_009E':   'Asian and Pacific Island languages',
        'B16002_012E':   'Other languages',

        // Household Tenure -- pie
        'B25003_002E':   'Owner occupied',
        'B25003_003E':   'Renter occupied',

        // Median Home Value -- number
        'B25077_001E':   'Median value (dollars)',

        // Median Year Householder Moved In by Tenure -- bullet?
        'B25039_002E':   'Owner occupied',
        'B25039_003E':   'Renter occupied'
    };


    // mapping of vars which should be weighted avg to which vars they should
    // be weighted against
    var ACSPopWeightedVars = {
        // Median Age by Gender, weight by population of genders
        'B01002_002E':   'B01001_002E',  // male population
        'B01002_003E':   'B01001_026E',  // female population

        // Per Capita Income
        'B19301_001E':   'B01001_001E',  // total population

        // Median household income
        'B19013_001E':   'B11001_001E',  // total households

        // Median home value
        'B25077_001E':   'B11001_001E',  // total households

        // Median year householder moved in
        'B25039_002E':   'B11001_001E',  // owner occupied
        'B25039_003E':   'B11001_001E'   // renter occupied
    };
    angular.module('imls.acs')
    .constant('ACSVariables', ACSVariables)
    .constant('ACSPopWeightedVars', ACSPopWeightedVars);

})();
