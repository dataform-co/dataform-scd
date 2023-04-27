/**
 * Builds a type-2 slowly changing dimensions table and view.
 */
module.exports = (
    name,
    { uniqueKey, hash, timestamp, source, tags, incrementalConfig, columns = {} }
) => {
  // Create an incremental table with just pure updates, for a full history of the table.
  const updates = publish(`${name}_updates`, {
    type: "incremental",
    tags,
    columns,
    ...incrementalConfig,
  }).query(
    !!hash ?
       (ctx) => `
    ${ctx.when(
          ctx.incremental(), `with ids_to_update as \
        (select ${uniqueKey}, ${hash}  from ${ctx.ref(source)}\
        except distinct \
        (select ${uniqueKey}, ${hash} from ${ctx.self()}))`
      )}
      select * from ${ctx.ref(source)}
      ${ctx.when(
          ctx.incremental(),
          `where ${timestamp} > (select max(${timestamp}) from ${ctx.self()})
        and ${uniqueKey} in (select ${uniqueKey} from ids_to_update)`
      )}`
    :
  (ctx) => `
      select * from ${ctx.ref(source)}
      ${ctx.when(
        ctx.incremental(),
        `where ${timestamp} > (select max(${timestamp}) from ${ctx.self()})`
      )}`
  );


  // Create a view on top of the raw updates table that contains computed valid_from and valid_to fields.
  const view = publish(name, {
    type: "view",
    tags,
    columns: {
      ...columns,
      scd_valid_from: `The timestamp from which this row is valid for the given ${uniqueKey}.`,
      scd_valid_to: `The timestamp until which this row is valid for the given ${uniqueKey}, or null if this it the latest value.`,
    },
  }).query(
      (ctx) => `
  select
    *,
    ${timestamp} as scd_valid_from,
    lead(${timestamp}) over (partition by ${uniqueKey} order by ${timestamp} asc) as scd_valid_to
  from
    ${ctx.ref(`${name}_updates`)}
  `
  );

  // Returns the tables so they can be customized.
  return { view, updates };
};