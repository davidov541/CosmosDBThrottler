const cosmos = require('./cosmos');

module.exports = async function(context, msg) {
    const parsed = JSON.parse(msg);
    switch(parsed.entityType)
    {
        case 'vertex':
            await cosmos.createEntryOfKind(parsed.kind, parsed.id, parsed.properties, parsed.edges);
            break;
        case 'edge':
            await cosmos.createEdge(parsed.source, parsed.target, parsed.relationship, parsed.properties);
            break;
        case 'deletion':
            await cosmos.deleteEntry(parsed.id, parsed.edgeLabelsToFollow);
            break;
    }
};