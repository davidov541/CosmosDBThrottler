const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../cosmosThrottler/writeToCosmos'); // the module to test
const createEntryOfKindSpy = sinon.spy(); // the fake method on the dependency
const cosmosMock = {
    createEntryOfKind: createEntryOfKindSpy
};
uut.__set__("cosmos", cosmosMock);

describe('Entry Point Tests', function () {
    test('should request cosmos to create the vertex', async function () {
        const message = {
            entityType: "vertex",
            kind: "fakeKind",
            id: "someID",
            properties: {
                property1: "prop1val",
                property2: "prop2val"
            },
            edges: [
                "edge1",
                "edge2"
            ]
        }

        const context = {};
        await uut(context, JSON.stringify(message));

        expect(createEntryOfKindSpy.called).toBeTruthy();
        expect(createEntryOfKindSpy.callCount).toBe(1);
        const args = createEntryOfKindSpy.args[0];
        expect(args[0]).toBe(message.kind);
        expect(args[1]).toBe(message.id);
        expect(args[2]).toEqual(message.properties);
        expect(args[3]).toEqual(message.edges);
    });
});