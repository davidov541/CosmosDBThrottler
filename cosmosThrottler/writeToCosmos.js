const cosmos = require('./cosmos');

module.exports = async function(context, msg) {
    console.log("Context: " + JSON.stringify(context));
    console.log("Message: " + JSON.stringify(msg));
    console.log("Message2: " + msg);
    const parsed = JSON.parse(msg);
    console.log("Message3: " + parsed);
    console.log("Entity type: " + parsed.entityType);
    switch(parsed.entityType)
    {
        case 'vertex':
            console.log("Adding vertex")
            await cosmos.createEntryOfKind(parsed.kind, parsed.id, parsed.properties, parsed.edges);
            break;
        case 'edge':
            console.log("Adding edge")
            await cosmos.createEdge(parsed.source, parsed.target, parsed.relationship, parsed.properties);
            break;
    }
};