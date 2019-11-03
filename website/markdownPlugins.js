// Customize Markdown


const ejs = require("ejs");

// Template engine
const template = (md) => {
   md.core.ruler.before("block", "template", (state) => {
        state.src = ejs.render(state.src, {
            user: true
        });
        return state;
   });
};

// Replace inline or links with images
const plantuml = (md) => {
    require("remarkable-plantuml")(md, { base_path: './static'});
};

const classy = require("remarkable-classy");

module.exports = [
    function init(md) {
        md.set({
            breaks: true, // \n -> <br/>
            typographer: true
        })
    },
    template,
    plantuml,
    classy
];