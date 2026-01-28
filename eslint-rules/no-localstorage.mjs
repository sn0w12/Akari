const noLocalStorage = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Disallow direct use of localStorage and sessionStorage, suggest using StorageManager",
            recommended: true,
        },
        messages: {
            noLocalStorage:
                "Do not use {{storage}}. Use StorageManager from @/lib/storage instead.",
        },
        schema: [], // No options for this rule
    },
    create(context) {
        return {
            MemberExpression(node) {
                // Check if the object is 'localStorage' or 'sessionStorage'
                if (
                    node.object.type === "Identifier" &&
                    (node.object.name === "localStorage" ||
                        node.object.name === "sessionStorage")
                ) {
                    context.report({
                        node,
                        messageId: "noLocalStorage",
                        data: { storage: node.object.name },
                    });
                }
            },
        };
    },
};

export default noLocalStorage;
