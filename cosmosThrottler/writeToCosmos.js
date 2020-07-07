var cosmos = require('./cosmos');

module.exports = async function(_, msg) {
    const parsed = JSON.parse(msg);
    console.log(cosmos);
    switch(parsed.command)
    {
        case 'add-vertex':
            await cosmos.createEntryOfKind(parsed.kind, parsed.id, parsed.properties, parsed.edges);
            break;
        case 'add-edge':
            await cosmos.createEdge(parsed.source, parsed.target, parsed.relationship, parsed.properties);
            break;
        case 'delete-vertex':
            await cosmos.deleteEntry(parsed.id, parsed.edgeLabelsToFollow);
            break;
    }
};