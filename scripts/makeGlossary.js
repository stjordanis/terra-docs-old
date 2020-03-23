const ejs = require("ejs");
const fs = require('fs');

const file = "../docs/proto-glossary.md";

ejs.renderFile("scripts/glossary-template.md.ejs", {
    terms: [
        {
            title: "hi",
            definition: "item"
        },
        {
            title: "hipp",
            definition: "item"
        }
    ]
}).then((contents) => {
    console.log("Writing Glossary to " + file)
    fs.writeFileSync(file, contents)
});