var cosmos = require('./cosmos');

async function processRequest(parsed) {
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
            case 'delete-edge':
                await cosmos.deleteEdge(parsed.id);
                break;
        }
}

module.exports = async function(_, msg) {
    console.log("Processing request: " + JSON.stringify(msg))
    
    if (msg.environment == process.env.ENVIRONMENT)
    {
        for (var i = 0; i < msg.commands.length; i++)
        {
            await processRequest(msg.commands[i])
        }
    }
};