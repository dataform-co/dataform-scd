/**
 * Builds a slowly changing dimensions table.
 */
module.exports = (name, {
  uniqueKey,
  timestamp,
  source,
  incrementalConfig
}) => {
  /**
   * Create an incremental table with just pure updates, for a full history of the table.
   */
  const updates = publish(`${name}_updates`, {
    type: "incremental",
    ...incrementalConfig
  }).query(ctx => `
    select * from ${ctx.ref(source)}
${ctx.when(ctx.incremental(), `
where updated_at > (select max(updated_at) from ${ctx.self()})
`)}
`)

  /**
   * Create a view on top of the raw updates table that contains computed valid_from and valid_to fields.
   */
  publish(name, {
    type: "view",
  }).query(ctx => `
select
  *,
  ${timestamp} as scd_valid_from,
  lead(${timestamp}) over (partition by ${uniqueKey} order by ${timestamp} asc) as scd_valid_to
from
  ${ctx.ref(`${name}_updates`)}
`)
}
