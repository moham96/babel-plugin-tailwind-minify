import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import * as fs from "fs";
import * as path from "path";

interface Babel {
  types: typeof t;
}

interface GroupedClasses {
  [groupName: string]: string[];
}

interface PluginOptions {
  cssFilePath?: string; // Option to specify the CSS file path
}

let classGroupCounter = 1;
const classGroups: Record<string, string> = {}; // Map of class sets to group names
const generatedGroups: Record<string, string[]> = {}; // Group name to class array mapping

// Generate a unique group name for a set of classes
function generateClassGroup(classes: string[]): string {
  const sortedClasses = classes.sort().join(" "); // Sort classes to ensure consistency in comparison

  // If the group already exists, return the existing group name
  if (classGroups[sortedClasses]) {
    return classGroups[sortedClasses];
  }

  // Create a new group
  const groupName = `group-${classGroupCounter++}`;
  classGroups[sortedClasses] = groupName;
  generatedGroups[groupName] = classes;

  return groupName;
}

// Function to write the generated @apply directives to a CSS file
function writeToCSSFile(cssFilePath: string) {
  const filePath = path.resolve(cssFilePath);
  let cssContent =
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n";

  Object.entries(generatedGroups).forEach(([groupName, classes]) => {
    const classesString = classes.join(" ");
    cssContent += `.${groupName} {\n @apply ${classesString};\n  }\n\n`;
  });

  fs.writeFileSync(filePath, cssContent, "utf8");
  console.log(`CSS file written to: ${filePath}`);
}

export default function (babel: Babel, options: PluginOptions = {}) {
  const { types: t } = babel;
  const cssFilePath = options.cssFilePath || "./generated.css"; // Default file path

  return {
    visitor: {
      JSXAttribute(path: NodePath<t.JSXAttribute>) {
        if (path.node.name.name !== "className") return;

        // Get the className value as a string
        const classNames = (path.node.value as t.StringLiteral).value || "";
        if (classNames === "") return;

        // Split classNames into an array and remove empty values
        const classArray = classNames.split(/\s+/).filter(Boolean);

        // Generate the class group for this array of classes
        const groupName = generateClassGroup(classArray);

        // Replace the original className with the generated group name
        (path.node.value as t.StringLiteral).value = groupName;
      },
    },
    post() {
      // Write the generated CSS file with the @apply directives
      writeToCSSFile(cssFilePath);
    },
  };
}
