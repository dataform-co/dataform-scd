const scd = require("../index");

/**
 * Create an SCD table on top of the fake table defined in source_data.sqlx.
 */
const { updates, view } = scd("source_data_scd", {
  // A unique identifier for rows in the table.
  uniqueKey: "user_id",
  // A field that stores a timestamp or date of when the row was last changed.
  timestamp: "updated_at",
  // The source table to build slowly changing dimensions from.
  source: {
    schema: "dataform_scd_example",
    name: "source_data",
  },
  // Any tags that will be added to actions.
  tags: ["slowly-changing-dimensions"],
  // Optional documentation of table columns
  columns: {user_id: "User ID", some_field: "Data Field", updated_at: "Timestamp for updates"},
  // Any configuration parameters to apply to the incremental table that will be created.
  incrementalConfig: {
    bigquery: {
      partitionBy: "updated_at",
    },
  },
});

// Additional customization of the created models can be done by using the returned actions objects.
updates.config({
  description: "Updates table for SCD",
});
