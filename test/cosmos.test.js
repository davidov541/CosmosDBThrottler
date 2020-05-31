const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../cosmosThrottler/cosmos');
const clientStub = sinon.stub();

const submitReturnValue = {
    attributes: {
        'x-ms-request-charge': 10
    }
}
const submitFake = sinon.fake.returns(submitReturnValue);
const openSpy = sinon.spy();
const closeSpy = sinon.spy();

const clientInstanceMock = {
    open: openSpy,
    submit: submitFake,
    close: closeSpy
}

clientStub.returns(clientInstanceMock);

const gremlinMock = {
    driver: {
        Client: clientStub
    },
};

uut.__set__("gremlin", gremlinMock);
uut.__set__("GetAuthenticator", () => {})
describe('Cosmos Interface Tests', function () {
    beforeEach(() => {
        openSpy.resetHistory();
        submitFake.resetHistory();
        closeSpy.resetHistory();
    });
    
    test('should properly ask to create vertex', async function () {
        const message = {
            kind: "someKind",
            id: "someId",
            properties: {
                property1: "prop1val",
                property2: "prop2val"
            },
            edges: [
                {
                    id: "edge1",
                    relationship: "relationship1",
                    properties: {
                        property1: "prop1val",
                        property2: "prop2val"
                    }
                },
                {
                    id: "edge2",
                    relationship: "relationship2",
                    properties: {
                        property3: "prop3val",
                        property4: "prop4val"
                    }
                },
            ]
        }
        
        await uut.createEntryOfKind(message.kind, message.id, message.properties, message.edges);

        expect(openSpy.called).toBeTruthy();
        expect(openSpy.callCount).toBe(1);

        expect(submitFake.called).toBeTruthy();
        expect(submitFake.callCount).toBe(3);

        // Creating the vertex.
        const expectedQueryVertex = "g.addV(label).property('id', id).property('partition_key', partition_key).property('property1', 'prop1val').property('property2', 'prop2val')";
        const expectedParametersVertex = {
            label: message.kind,
            id: message.id,
            partition_key: message.id
        }
        const args1 = submitFake.args[0];
        expect(args1[0]).toBe(expectedQueryVertex);
        expect(args1[1]).toEqual(expectedParametersVertex);

        // Creating the first edge.
        const expectedQueryEdge1 = "g.V(source).addE(relationship).to(g.V(target)).property('property1', 'prop1val').property('property2', 'prop2val')";
        const expectedParametersEdge1 = {
            source: message.id,
            relationship: message.edges[0].relationship,
            target: message.edges[0].id
        }
        const args2 = submitFake.args[1];
        expect(args2[0]).toBe(expectedQueryEdge1);
        expect(args2[1]).toEqual(expectedParametersEdge1);

        // Creating the second edge.
        const expectedQueryEdge2 = "g.V(source).addE(relationship).to(g.V(target)).property('property3', 'prop3val').property('property4', 'prop4val')";
        const expectedParametersEdge2 = {
            source: message.id,
            relationship: message.edges[1].relationship,
            target: message.edges[1].id
        }
        const args3 = submitFake.args[2];
        expect(args3[0]).toBe(expectedQueryEdge2);
        expect(args3[1]).toEqual(expectedParametersEdge2);

        expect(closeSpy.called).toBeTruthy();
        expect(closeSpy.callCount).toBe(1);
    });
    
    test('should properly ask to create edge', async function () {
        const message = {
            source: "someSource",
            target: "someTarget",
            relationship: "fakeRelationship",
            properties: {
                property1: "prop1val",
                property2: "prop2val"
            }
        }
        
        await uut.createEdge(message.source, message.target, message.relationship, message.properties);

        const expectedQuery = "g.V(source).addE(relationship).to(g.V(target)).property('property1', 'prop1val').property('property2', 'prop2val')";
        const expectedParameters = {
            source: message.source,
            relationship: message.relationship,
            target: message.target
        }

        expect(openSpy.called).toBeTruthy();
        expect(openSpy.callCount).toBe(1);

        expect(submitFake.called).toBeTruthy();
        expect(submitFake.callCount).toBe(1);
        const args = submitFake.args[0];
        expect(args[0]).toBe(expectedQuery);
        expect(args[1]).toEqual(expectedParameters);

        expect(closeSpy.called).toBeTruthy();
        expect(closeSpy.callCount).toBe(1);
    });
    
    test('should properly ask to delete entry', async function () {
        const message = {
            id: "someEntry",
            edgeLabelsToFollow: ["label1", "label2"]
        }
        
        await uut.deleteEntry(message.id, message.edgeLabelsToFollow);

        expect(openSpy.called).toBeTruthy();
        expect(openSpy.callCount).toBe(1);

        expect(submitFake.called).toBeTruthy();
        expect(submitFake.callCount).toBe(2);

        const expectedQuery1 = "g.V(id).outE().hasLabel(labels).inV().drop()";
        const expectedParameters1 = {
            labels: "'label1','label2'",
            id: message.id
        }
        const args1 = submitFake.args[0];
        expect(args1[0]).toBe(expectedQuery1);
        expect(args1[1]).toEqual(expectedParameters1);

        const expectedQuery2 = "g.V(id).drop()";
        const expectedParameters2 = {
            id: message.id
        }
        const args2 = submitFake.args[1];
        expect(args2[0]).toBe(expectedQuery2);
        expect(args2[1]).toEqual(expectedParameters2);

        expect(closeSpy.called).toBeTruthy();
        expect(closeSpy.callCount).toBe(1);
    });
});