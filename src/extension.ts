// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import * as linter from 'yaml-lint';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "yaml-flattener" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('yaml-flattener.helloWorld', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
      const document = editor.document;
      const text = document.getText();
      const options = { prettyErrors: true, schema: yaml.DEFAULT_SCHEMA };
      const data = yaml.safeLoad(text, options);
      // Perform any required transformations on the data structure
      const formattedYaml = yaml.safeDump(data);
      fs.writeFile(document.uri.fsPath, formattedYaml, (error) => {
        if (error) {
          vscode.window.showErrorMessage(`Failed to format YAML: ${error.message}`);
        } else {
          vscode.window.showInformationMessage('YAML formatted successfully!');
        }
      });
      // Lint the YAML code and report any errors or warnings
      linter.lint(text, (error, result) => {
        if (error) {
          vscode.window.showErrorMessage(`Failed to lint YAML: ${error.message}`);
        } else if (result && result.errors && result.errors.length > 0) {
          vscode.window.showWarningMessage(`YAML lint issues: ${result.errors.length}`);
        } else {
          vscode.window.showInformationMessage('YAML linted successfully!');
        }
      });
    }
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from yaml-flattener!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
