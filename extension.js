// The module 'vscode' contains the VS Code extensibility API
const vscode = require("vscode")
const path = require("path")
// const fs = require("fs")

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("Live Design Preview extension is now active")

  // Register the command to open the preview
  const disposable = vscode.commands.registerCommand("liveDesign.start", () => {
    const panel = vscode.window.createWebviewPanel("designPreview", "Live Preview", vscode.ViewColumn.Beside, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "media"))],
    })

    // Initial content
    updateWebviewContent(panel)

    // Update the content when the active editor changes
    vscode.window.onDidChangeActiveTextEditor(() => {
      updateWebviewContent(panel)
    })

    // Update the content when the document is saved
    vscode.workspace.onDidSaveTextDocument(() => {
      updateWebviewContent(panel)
    })

    // Update the content when the document changes
    vscode.workspace.onDidChangeTextDocument(() => {
      updateWebviewContent(panel)
    })
  })

  context.subscriptions.push(disposable)
}

function updateWebviewContent(panel) {
  const editor = vscode.window.activeTextEditor

  if (!editor) {
    panel.webview.html = getWebviewContent("No active editor")
    return
  }

  const document = editor.document
  const fileName = document.fileName
  const fileExtension = path.extname(fileName).toLowerCase()

  if (fileExtension === ".html" || fileExtension === ".htm") {
    panel.webview.html = document.getText()
  } else if (fileExtension === ".css") {
    // For CSS files, create a simple HTML page that includes the CSS
    const cssContent = document.getText()
    panel.webview.html = getWebviewContentForCSS(cssContent)
  } else {
    panel.webview.html = getWebviewContent("Not an HTML or CSS file")
  }
}

function getWebviewContent(message) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Preview</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <h1>${message}</h1>
    <p>Open an HTML or CSS file to see the preview</p>
  </body>
  </html>`
}

function getWebviewContentForCSS(cssContent) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Preview</title>
    <style>
      ${cssContent}
    </style>
  </head>
  <body>
    <div class="container">
      <h1>CSS Preview</h1>
      <p>This is a paragraph to demonstrate text styling</p>
      <button>Button Example</button>
      <div class="box">Box Element</div>
    </div>
  </body>
  </html>`
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}

