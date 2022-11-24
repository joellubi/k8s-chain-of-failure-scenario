WITH

  -- The earliest time we've seen a particular serverid is considered its started_at time
  start_times AS (
  SELECT
    jsonPayload.serverid,
    jsonPayload.trialnumber,
    MIN(timestamp) AS started_at,
  FROM
    `<PROJECT_ID>.<LOGGING_SINK_DATASET>.stdout_*`
  GROUP BY
    jsonPayload.serverid,
    jsonPayload.trialnumber
  ORDER BY
    started_at ASC ),

  -- Once we've seen an error from a  particular serverid is considered its ended_at time
  end_times AS (
  SELECT
    jsonPayload.serverid,
    jsonPayload.trialnumber,
    timestamp AS ended_at,
  FROM
    `<PROJECT_ID>.<LOGGING_SINK_DATASET>.stdout_*`
  WHERE
    jsonPayload.error = TRUE
  ORDER BY
    ended_at ASC ),

  -- Combine into a table of start and end times for each distinct server instance
  start_and_end_times AS (
  SELECT
    start_times.serverid,
    start_times.trialnumber,
    started_at,
    ended_at,
  FROM
    start_times
  LEFT JOIN
    end_times
  ON
    start_times.serverid = end_times.serverid
  WHERE
    -- Servers that never successfully handle a request are excluded
    started_at <> ended_at
  ORDER BY
    started_at ASC ),

  -- Indicate '1' at every timestamp at which we gained a server instance
  boot_timestamps AS (
  SELECT
    started_at AS timestamp,
    trialnumber,
    1 AS change_in_server_count,
  FROM
    start_and_end_times ),

  -- Indicate '-1' at every timestamp at which we lost a server instance
  shutdown_timestamps AS (
  SELECT
    ended_at AS timestamp,
    trialnumber,
    -1 AS change_in_server_count,
  FROM
    start_and_end_times
  WHERE
    ended_at IS NOT NULL ),

  -- Combine +1 and -1 changes into a sequenced stream of events
  server_count_changes AS (
  SELECT
    *
  FROM
    boot_timestamps
  UNION ALL
  SELECT
    *
  FROM
    shutdown_timestamps
  ORDER BY
    timestamp ASC )

-- Final SELECT
-- Aggregate server count changes into cumulative number of servers available
SELECT
  timestamp,
  trialnumber,
  SUM(change_in_server_count) OVER (PARTITION BY trialnumber ORDER BY timestamp ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW ) AS num_servers_available,
FROM
  server_count_changes;
