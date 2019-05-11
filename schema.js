const {
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLFloat,
  GraphQLEnumType
} = require('graphql');

const request = require('request-promise');

const UnitEnumType = new GraphQLEnumType({
  name: 'Unit',
  values: {
    KILOGRAMS: { value: 'kilograms' },
    LITERS: { value: 'liters' },
    GRAMS: { value: 'grams' },
    CELCIUS: { value: 'celcius' }
  }
});

const genericUnitType = new GraphQLObjectType({
  name: 'GenericUnitType',
  fields: {
    value: {
      type: GraphQLFloat
    },
    unit: {
      type: UnitEnumType
    }
  }
});

const fermentationType = new GraphQLObjectType({
  name: 'Fermentation',
  fields: {
    temp: {
      type: genericUnitType
    }
  }
});

const mashTemperatureType = new GraphQLObjectType({
  name: 'MashTemperature',
  fields: {
    temp: {
      type: genericUnitType
    },
    duration: {
      type: GraphQLInt
    }
  }
});

const methodType = new GraphQLObjectType({
  name: 'Method',
  fields: {
    mash_temp: {
      type: new GraphQLList(mashTemperatureType)
    },
    fermentation: {
      type: fermentationType
    }
  }
});

const amountType = new GraphQLObjectType({
  name: 'Amount',
  fields: {
    value: {
      type: GraphQLFloat
    },
    unit: {
      type: UnitEnumType
    }
  }
});

const maltType = new GraphQLObjectType({
  name: 'Malt',
  fields: {
    name: {
      type: GraphQLString
    },
    amount: {
      type: genericUnitType
    }
  }
});

const hopType = new GraphQLObjectType({
  name: 'Hop',
  fields: {
    name: {
      type: GraphQLString
    },
    amount: {
      type: amountType
    },
    add: {
      type: GraphQLString
    },
    attribute: {
      type: GraphQLString
    }
  }
});

const ingredientsType = new GraphQLObjectType({
  name: 'Ingredients',
  fields: {
    malt: {
      type: new GraphQLList(maltType)
    },
    hops: {
      type: new GraphQLList(hopType)
    },
    yeast: {
      type: GraphQLString
    }
  }
});

const beerType = new GraphQLObjectType({
  name: 'Beer',
  fields: {
    id: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString
    },
    tagline: {
      type: GraphQLString
    },
    first_brewed: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    image_url: {
      type: GraphQLString
    },
    abv: {
      type: GraphQLFloat
    },
    ibu: {
      type: GraphQLFloat
    },
    target_fg: {
      type: GraphQLFloat
    },
    target_og: {
      type: GraphQLFloat
    },
    ebc: {
      type: GraphQLFloat
    },
    srm: {
      type: GraphQLFloat
    },
    ph: {
      type: GraphQLFloat
    },
    attenuation_level: {
      type: GraphQLFloat
    },
    volume: {
      type: genericUnitType
    },
    boil_volume: {
      type: genericUnitType
    },
    method: {
      type: methodType
      // twist: null
    },
    ingredients: {
      type: ingredientsType
    },
    food_pairing: {
      type: new GraphQLList(GraphQLString)
    },
    brewers_tips: {
      type: GraphQLString
    },
    contributed_by: {
      type: GraphQLString
    }
  }
});

const qMap = {
  name: 'beer_name'
};

function buildParamsString(queryObject) {
  return Object.entries(queryObject)
    .map(([key, value]) => {
      const formattedValue =
        typeof value === 'string'
          ? value.replace(/ /g, '_').toLowerCase()
          : value;

      const foundKey = qMap.hasOwnProperty(key) ? qMap[key] : key;

      return `${foundKey}=${formattedValue}`;
    })
    .join('&');
}

const beerQuery = new GraphQLObjectType({
  name: 'BeerQuery',
  fields: {
    beers: {
      type: new GraphQLList(beerType),
      args: {
        yeast: {
          type: GraphQLString
        },
        hops: {
          type: GraphQLString
        },
        malt: {
          type: GraphQLString
        },
        name: {
          type: GraphQLString
        },
        id: {
          type: GraphQLID
        }
      },
      resolve: async function(_, args) {
        console.log('beerQuery:resolve args %o', args);
        const { id, ...q } = args;

        let results;

        if (id) {
          results = await request(
            `https://api.punkapi.com/v2/beers/${id}`
          ).then(JSON.parse);
        } else {
          const params = buildParamsString(q);
          const url = `https://api.punkapi.com/v2/beers?${params}`;
          results = await request(url).then(JSON.parse);
        }

        return results;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: beerQuery
});
