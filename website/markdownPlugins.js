// Customize Markdown

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
    plantuml,
    classy
];