﻿const cosmos = require('./cosmos');

module.exports = async function(context, msg) {
    context.log("Context: " + JSON.stringify(context));
    context.log("Message: " + JSON.stringify(msg));
    switch(msg.entityType)
    {
        case 'vertex':
            await cosmos.createEntryOfKind(msg.kind, msg.id, msg.properties, msg.edges);
            break;
        case 'edge':
            await cosmos.createEdge(msg.source, msg.target, msg.relationship, msg.properties);
            break;
    }
};