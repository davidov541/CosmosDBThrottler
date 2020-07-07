const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../cosmosThrottler/writeToCosmos');
const createEntryOfKindSpy = sinon.spy();
const createEdgeSpy = sinon.spy();
const deleteEntrySpy = sinon.spy();
const deleteEdgeSpy = sinon.spy();
const cosmosMock = {
    createEntryOfKind: createEntryOfKindSpy,
    createEdge: createEdgeSpy,
    deleteEntry: deleteEntrySpy,
    deleteEdge: deleteEdgeSpy
};
uut.__set__("cosmos", cosmosMock);

describe('Entry Point Tests', function () {
    beforeEach(() => {
        createEntryOfKindSpy.resetHistory();
        createEdgeSpy.resetHistory();
        deleteEntrySpy.resetHistory();
        deleteEdgeSpy.resetHistory();
    });

    test('should request cosmos to create the vertex', async function () {
        const message = [{
            command: "add-vertex",
            kind: "fakeKind",
            id: "someID",
            properties: {
                property1: "prop1val",
                property2: "prop2val"
            },
            edges: [
                "edge1",
                "edge2"
            ],
            environment: process.env.ENVIRONMENT
        }]

        const context = {};
        await uut(context, JSON.stringify(message));

        expect(createEntryOfKindSpy.called).toBeTruthy();
        expect(createEntryOfKindSpy.callCount).toBe(1);
        const args = createEntryOfKindSpy.args[0];
        expect(args[0]).toBe(message[0].kind);
        expect(args[1]).toBe(message[0].id);
        expect(args[2]).toEqual(message[0].properties);
        expect(args[3]).toEqual(message[0].edges);
    });

    test('should request cosmos to create the edge', async function () {
        const message = [{
            command: "add-edge",
            source: "someSource",
            target: "someTarget",
            relationship: "fakeRelationship",
            properties: {
                property1: "prop1val",
                property2: "prop2val"
            },
            environment: process.env.ENVIRONMENT
        }]

        const context = {};
        await uut(context, JSON.stringify(message));

        expect(createEdgeSpy.called).toBeTruthy();
        expect(createEdgeSpy.callCount).toBe(1);
        const args = createEdgeSpy.args[0];
        expect(args[0]).toBe(message[0].source);
        expect(args[1]).toBe(message[0].target);
        expect(args[2]).toBe(message[0].relationship);
        expect(args[3]).toEqual(message[0].properties);
    });

    test('should request cosmos to delete an entity', async function () {
        const message = [{
            command: "delete-vertex",
            id: "someEntity",
            edgeLabelsToFollow: ["label1", "label2"],
            environment: process.env.ENVIRONMENT
        }]

        const context = {};
        await uut(context, JSON.stringify(message));

        expect(deleteEntrySpy.called).toBeTruthy();
        expect(deleteEntrySpy.callCount).toBe(1);
        const args = deleteEntrySpy.args[0];
        expect(args[0]).toBe(message[0].id);
        expect(args[1]).toEqual(message[0].edgeLabelsToFollow);
    });

    test('should request cosmos to delete an edge', async function () {
        const message = [{
            command: "delete-edge",
            id: "someEdge",
            environment: process.env.ENVIRONMENT
        }]

        const context = {};
        await uut(context, JSON.stringify(message));

        expect(deleteEdgeSpy.called).toBeTruthy();
        expect(deleteEdgeSpy.callCount).toBe(1);
        const args = deleteEdgeSpy.args[0];
        expect(args[0]).toBe(message[0].id);
    });

    test('should handle multiple commands in one message', async function () {
        const message = [
            {
                command: "delete-edge",
                id: "someEdge",
                environment: process.env.ENVIRONMENT
            },
            {
                command: "delete-vertex",
                id: "someEntity",
                edgeLabelsToFollow: ["label1", "label2"],
                environment: process.env.ENVIRONMENT
            }
        ]

        const context = {};
        await uut(context, JSON.stringify(message));

        expect(deleteEdgeSpy.called).toBeTruthy();
        expect(deleteEdgeSpy.callCount).toBe(1);
        const edgeArgs = deleteEdgeSpy.args[0];
        expect(edgeArgs[0]).toBe(message[0].id);

        expect(deleteEntrySpy.called).toBeTruthy();
        expect(deleteEntrySpy.callCount).toBe(1);
        const entryArgs = deleteEntrySpy.args[0];
        expect(entryArgs[0]).toBe(message[1].id);
        expect(entryArgs[1]).toEqual(message[1].edgeLabelsToFollow);
    });
});