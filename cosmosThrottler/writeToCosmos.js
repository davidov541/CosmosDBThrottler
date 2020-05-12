const cosmos = require('./cosmos');

module.exports = async function(context, msg) {
    console.log("Context: " + JSON.stringify(context));
    console.log("Message: " + JSON.stringify(msg));
    console.log("Message2: " + msg);
    console.log("Entity type: " + msg.entityType);
    switch(msg.entityType)
    {
        case 'vertex':
            console.log("Adding vertex")
            await cosmos.createEntryOfKind(msg.kind, msg.id, msg.properties, msg.edges);
            break;
        case 'edge':
            console.log("Adding edge")
            await cosmos.createEdge(msg.source, msg.target, msg.relationship, msg.properties);
            break;
    }
};