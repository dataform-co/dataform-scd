const scd = require("../includes/scd.js");

scd("source_data_scd", {
  uniqueKey: "user_id",
  timestamp: "updated_at",
  source: {
    schema: "dataform_scd_example",
    name: "source_data"
  },
  incrementalConfig: {
    bigquery: {
      partitionBy: "updated_at"
    }
  }
});
