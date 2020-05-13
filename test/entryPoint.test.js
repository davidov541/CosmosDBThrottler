const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../cosmosThrottler/writeToCosmos');
const createEntryOfKindSpy = sinon.spy();
const createEdgeSpy = sinon.spy();
const deleteEntrySpy = sinon.spy();
const cosmosMock = {
    createEntryOfKind: createEntryOfKindSpy,
    createEdge: createEdgeSpy,
    deleteEntry: deleteEntrySpy
};
uut.__set__("cosmos", cosmosMock);

describe('Entry Point Tests', function () {
    beforeEach(() => {
        createEntryOfKindSpy.resetHistory();
        createEdgeSpy.resetHistory();
        deleteEntrySpy.resetHistory();
    });

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

    test('should request cosmos to create the edge', async function () {
        const message = {
            entityType: "edge",
            source: "someSource",
            target: "someTarget",
            relationship: "fakeRelationship",
            properties: {
                property1: "prop1val",
                property2: "prop2val"
            }
        }

        const context = {};
        await uut(context, JSON.stringify(message));

        expect(createEdgeSpy.called).toBeTruthy();
        expect(createEdgeSpy.callCount).toBe(1);
        const args = createEdgeSpy.args[0];
        expect(args[0]).toBe(message.source);
        expect(args[1]).toBe(message.target);
        expect(args[2]).toBe(message.relationship);
        expect(args[3]).toEqual(message.properties);
    });

    test('should request cosmos to delete an entity', async function () {
        const message = {
            entityType: "deletion",
            id: "someEntity",
            edgeLabelsToFollow: ["label1", "label2"]
        }

        const context = {};
        await uut(context, JSON.stringify(message));

        expect(deleteEntrySpy.called).toBeTruthy();
        expect(deleteEntrySpy.callCount).toBe(1);
        const args = deleteEntrySpy.args[0];
        expect(args[0]).toBe(message.id);
        expect(args[1]).toEqual(message.edgeLabelsToFollow);
    });
});