import 'dotenv/config';
import assert from 'node:assert/strict';
import { TestContext, describe, it, after } from "node:test";
import { app } from "..";

after(() => app.close());

describe('Healthcheck', () => { 
    it('should return 200', async (t: TestContext) => {
        await app.ready();

        const response = await app.inject({
            method: 'GET',
            url: '/healthcheck',
        });

        assert.deepEqual(response.statusCode, 200, 'Status code should be 200');
    });
 })

 describe('Unknown Route', () => { 
    it('should return 404', async (t: TestContext) => {
        await app.ready();

        const response = await app.inject({
            method: 'GET',
            url: '/unknown',
        });

        assert.deepEqual(response.statusCode, 404, 'Status code should be 404');
    });
 })