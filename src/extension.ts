// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import * as linter from 'yaml-lint';

function processItem(processedData: any, item: any, aliases:any, key?: string) {
	if (item && typeof item === 'object') {
	  if (Array.isArray(item)) {
		processedData[key || ''] = [];
		item.forEach((value: any, index: number) => processItem(processedData, value, aliases, `${key || ''}[${index}]`));
	  } else if (item['*']) {
		aliases[item['*']] = { key, data: item };
	  } else {
		processedData[key || ''] = {};
		Object.entries(item).forEach(([childKey, childValue]) => processItem(processedData, childValue, aliases, `${key ? `${key}.` : ''}${childKey}`));
	  }
	} else {
	  processedData[key || ''] = item;
	}
  }

function deconstructAliases(data: any) {
	const processedData: any = {};
	const aliases: any = {};
	processItem(processedData,data, aliases);
	Object.entries(aliases).forEach(([alias, { key, data }]) => {
	  const value = processedData[alias];
	  if (key && key.endsWith('[]')) {
		const arrayKey = key.substring(0, key.length - 2);
		processedData[arrayKey] = processedData[arrayKey] || [];
		processedData[arrayKey].push(value);
	  } else {
		processedData[key || alias] = value;
	  }
	  delete data['*'];
	  delete processedData[alias];
	});
	return processedData;
  }

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
		console.log('editor', editor);
		if (editor) {
			const document = editor.document;
			const text = document.getText();
			const options = { prettyErrors: true, schema: yaml.DEFAULT_SAFE_SCHEMA };
			const data = yaml.load(text, options);
			const processedData = deconstructAliases(data);
			const formattedYaml = yaml.dump(processedData, options);
			fs.writeFile(document.uri.fsPath, formattedYaml, (error) => {
			  if (error) {
				vscode.window.showErrorMessage(`Failed to format YAML: ${error.message}`);
			  } else {
				vscode.window.showInformationMessage('YAML formatted successfully!');
			  }
			});
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
