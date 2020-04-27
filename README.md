Common data models for creating [type-2 slowly changing dimensions tables](https://en.wikipedia.org/wiki/Slowly_changing_dimension) from mutable data sources in [Dataform](https://github.com/dataform-co/dataform).

## Supported warehouses

- BigQuery
- Redshift/PG
- Snowflake

_If you would like us to add support for another warehouse, please get in touch via [email](mailto:team@dataform.co) or [Slack](https://slack.dataform.co/)_

## Installation

Add the package to your `package.json` file in your Dataform project. You can find the most up to package version on the [releases page](https://github.com/dataform-co/dataform-scd/releases).

## Configure the package

Create a new JS file in your `definitions/` folder create an SCD table with the following example:

```js
const scd = require("dataform-scd");

scd("source_data_scd", {
  // A unique identifier for rows in the table.
  uniqueKey: "user_id",
  // A field that stores a timestamp or date of when the row was last changed.
  timestamp: "updated_at",
  // The source table to build slowly changing dimensions from.
  source: {
    schema: "dataform_scd_example",
    name: "source_data",
  },
  // Any configuration parameters to apply to the incremental table that will be created.
  incrementalConfig: {
    bigquery: {
      partitionBy: "updated_at",
    },
  },
});
```

For more advanced customization of outputs, see the [example.js](https://github.com/dataform-co/dataform-scd/blob/master/definitions/example.js).

### Scheduling

Slowly changing dimensions can only by updated as quickly as these models are run. These models should typically be scheduled to run every day or every hour, depending on the granularity of changes you want to capture.

## Data models

This package will create two relations in the warehouse, for a given `name` these will be:

- `{name}` - a view with `scd_valid_from` and `scd_valid_to` fields
- `{name}_updates` - an incremental table that stores the change history of the source table
