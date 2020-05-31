var gremlin = require('gremlin');

const config = require("./config")
var authenticator = {}
try { 
    authenticator = new gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${config.database}/colls/${config.collection}`, config.primaryKey)
} catch (e) {
    console.log("Error while getting Gremlin authenticator: " + e)
}

function createClient() {
    return new gremlin.driver.Client(
        config.endpoint,
        {
            authenticator,
            traversalsource: "g",
            rejectUnauthorized: true,
            mimeType: "application/vnd.gremlin-v2.0+json"
        }
    );
}

async function createEntryOfKind(kind, id, properties, edges) {
    var command = "g.addV(label).property('id', id).property('partition_key', partition_key)"
    Object.keys(properties).forEach(k => command += `.property('${k}', '${properties[k]}')`)
    const client = createClient()
    await client.open();
    const result = await client.submit(command, {
        label: kind,
        id: id,
        partition_key: id
    })
    console.log("createEntryOfKind; kind = " + kind + 
    ";id = " + id + 
    ";properties = " + JSON.stringify(properties) + 
    ";edges = " + JSON.stringify(edges) + 
    "RUs used: " + result.attributes["x-ms-request-charge"])

    const edgePromises = edges.map(async e => await createEdgeInternal(id, e.id, e.relationship, e.properties, client))
    await Promise.all(edgePromises)

    await client.close();
}

async function createEdge(source, target, relationship, properties) {
    const client = createClient()
    await client.open();
    await createEdgeInternal(source, target, relationship, properties, client);
    client.close();
}

async function createEdgeInternal(source, target, relationship, properties, client) {
    var command = "g.V(source).addE(relationship).to(g.V(target))";
    Object.keys(properties).forEach(k => command += `.property('${k}', '${properties[k]}')`);
    const result = await client.submit(command, {
        source: source,
        relationship: relationship,
        target: target
    });
    console.log("createEdge; source = " + source +
        ";target = " + target +
        ";relationship = " + relationship +
        ";properties = " + JSON.stringify(properties) +
        "RUs used: " + result.attributes["x-ms-request-charge"]);
}

async function deleteEntry(id, edgeLabelsToFollow) {
    const edgeLabels = edgeLabelsToFollow.map(label => "'" + label + "'").join(',');
    const command1 = "g.V(id).outE().hasLabel(labels).inV().drop()";

    const client = createClient()
    await client.open();
    const result1 = await client.submit(command1, {
        id: id,
        labels: edgeLabels
    })
    console.log("deleteEntry #1; id = " + id +
    ";edgeLabelsToFollow = " + JSON.stringify(edgeLabelsToFollow) +
    ";RUs used: " + result1.attributes["x-ms-request-charge"])

    var command2 = "g.V(id).drop()"
    const result2 = await client.submit(command2, {
        id: id
    })
    console.log("deleteEntry #2; id = " + id +
    ";edgeLabelsToFollow = " + JSON.stringify(edgeLabelsToFollow) +
    ";RUs used: " + result1.attributes["x-ms-request-charge"])

    await client.close();
}

exports.createEntryOfKind = createEntryOfKind;
exports.createEdge = createEdge;
exports.deleteEntry = deleteEntry;