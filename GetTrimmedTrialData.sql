CREATE OR REPLACE TABLE FUNCTION <LOGGING_SINK_DATASET>.GetTrimmedTrialData(trial INT64)
AS
  WITH

    -- Filter view to only data from this trial
    trial_data AS (
    SELECT
      *
    FROM
      `<PROJECT_ID>.<LOGGING_SINK_DATASET>.server_count_metrics`
    WHERE
      trialnumber = CAST(trial AS STRING) ),

    -- The end of the trial. The time at which the first total failure occurs, marking a service outage.
    first_error_time AS (
    SELECT
      MIN(timestamp)
    FROM
      `<PROJECT_ID>.<LOGGING_SINK_DATASET>.stderr_*`
    WHERE
      -- The load-generator may experience erroneous failures if it is started before the microservice deployment is ready.
      timestamp > (
      SELECT
        MIN(timestamp)
      FROM
        trial_data
      WHERE
        num_servers_available = 0) ),

    -- Assume that the max number of servers simultaneously seen at one point is equivalent to the number of replicas specified.
    max_server_count AS (
    SELECT
      MAX(num_servers_available)
    FROM
      trial_data ),

    -- The start of the trial. The first time at which all expected replicas are available.
    servers_ready_time AS (
    SELECT
      MIN(timestamp)
    FROM
      trial_data
    WHERE
      num_servers_available = (
      SELECT
        *
      FROM
        max_server_count) )

-- Final SELECT
-- All data after all servers are ready but before first service outage.
  SELECT
    *
  FROM
    trial_data
  WHERE
    timestamp < (
    SELECT
      *
    FROM
      first_error_time)
    AND timestamp >= (
    SELECT
      *
    FROM
      servers_ready_time);