import 'dotenv/config';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { NodeSDK, logs } from '@opentelemetry/sdk-node';
import { BunyanInstrumentation } from '@opentelemetry/instrumentation-bunyan';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

const sdk = new NodeSDK({
    logRecordProcessors: [
      new logs.SimpleLogRecordProcessor(new OTLPLogExporter())
    ],
    instrumentations: [
      new HttpInstrumentation({
        enabled: process.env.NODE_ENV !== 'test',
      }),
      new FastifyInstrumentation({
        enabled: process.env.NODE_ENV !== 'test',
      }),
      new BunyanInstrumentation({
        disableLogSending: process.env.NODE_ENV === 'test',
      }),
    ],
    traceExporter: new OTLPTraceExporter({
      url: 'https://api.honeycomb.io/v1/traces',
    }),
    serviceName: 'squid-crm-api',
  });
  
  process.on('beforeExit', async () => {
    await sdk.shutdown().finally(() => process.exit(0));
  });
  
  sdk.start();
  
  