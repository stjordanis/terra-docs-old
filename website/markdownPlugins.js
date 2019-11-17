// Customize Markdown

const ejs = require("ejs");
const katex = require("remarkable-katex");
// Template engine
const template = (md) => {
    md.core.ruler.before("block", "template", (state) => {
        state.src = ejs.render(state.src, {
            // put some variables here
        });
        return state;
   });
};

// Replace inline or links with images
const plantuml = (md) => {
    require("remarkable-plantuml")(md, { base_path: './static'});
};


function replaceGraphvizSnippets(token) {
    if (token.type === 'fence' && token.params === 'graphviz') {
        token.type = 'htmlblock';
        token.content = `<div data-graphviz>${token.content}</div>`;
        token.children = [];
    }
}

const graphviz = (md) => {
    md.core.ruler.after('block', 'graphviz', (state) => {
        state.tokens.forEach((token) => {
            replaceGraphvizSnippets(token);
        });
    });
}

const classy = require("remarkable-classy");

module.exports = [
    template,
    katex,
    plantuml,
    graphviz,
    classy
];