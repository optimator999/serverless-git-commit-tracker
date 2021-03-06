'use strict';

const exec = require('child_process').exec;
const fs = require('fs');


class ServerlessPlugin {
  
  
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.stage = this.options.stage || this.serverless.service.provider.stage;
    this.deploymentTracker = this.serverless.service.custom.gitCommitTracker;

    this.commands = {
      gitTrackerCreate: {
              usage: "Creates a file with git and version information for deployment identification",
              lifecycleEvents: ['set'],
          },
      gitCommitVersion: {
        usage: "Returns the latest commit version from git",
        lifecycleEvents: ['set'],
      },
      };

    this.hooks = {
    //  'before:welcome:hello': this.version-file.bind(this),
    "before:package:initialize": this.createVersionFile.bind(this),
    "gitTrackerCreate:set": this.createVersionFile.bind(this),
    "gitCommitVersion:set": this.getGitVersion.bind(this),
    "before:offline:start:init": this.createVersionFile.bind(this),
    };
    this.gitCmd = 'git log --name-status HEAD^..HEAD | head -1 | cut -c8-14';

  }

    
  //This executes an OS command
  runExec(cmd) {
    return new Promise((resolve, reject) => {
     exec(cmd, (error, stdout, stderr) => {
      if (error || stderr) {
       reject(error || stderr);
      }
      else resolve(stdout);
     });
    });
  }
  
  isvalidObject(item) {
      return item && typeof item == "object";
  }
  
  async getGitVersion() {
    
    await this.runExec(this.gitCmd).then(data => {
      this.serverless.cli.log(`Latest git Commit: ${data}`);
    }).catch(err => {
      this.serverless.cli.log("git Not Installed");
    });
  }
  
  async createMessage(html) {
  
    let git
    await this.runExec(this.gitCmd).then(data => {
      git = data;
    }).catch(err => {
      git = "Not Installed";
    });
     
    let message = `Git Version: ${git}\nDate: `;
    message += new Date().toLocaleString() + "\n";//.replace(/T/, ' ').replace(/\..+/, '') 
    message += `Stage: ${this.stage}\n`; 
    
    //If we want HTML then make the new lines html line breaks
    if (html) message = message.replace(/\n/g,"<br/>");
    
    return message
  }
  
 async replaceFile(location,message,regex) {
   
    //read the file
    let text = fs.readFileSync(location)
    //Use the regex from serverless.yml to create a new regex with "s" option
    //(dot matches new line) 
    let replace_regex = new RegExp(`${regex}`,"s")
    
    //replace anchors in the file with the message
    text = text.toString().replace(replace_regex,`$1${message}$2`);
    
    //write the new text back to the file
    fs.writeFileSync(location, text)
}
  
  async createVersionFile() {
    let params = this.deploymentTracker;

    // If we don't have an object then get out of here
    if (!this.isvalidObject(params)) {
        return;
    }

    // Only execute if we have a location for our file
    if (typeof params.location != undefined && params.location) {
    
      //Determine if we should deploy based on the deployment stage
      let skipDeployment = false;
      skipDeployment = (this.isvalidObject(params.deployment) && ! params.deployment.includes(this.stage));
      
      if (! skipDeployment) {
        
        let message = await this.createMessage(params.html);
        //this.serverless.cli.log(`Message: ${message}`);
        
       
        //If we've specified a regex expression then we'll replace that expression in the file. 
        //Otherwise we'll just write (overwrite) the file
        if (params.regex) {
          this.serverless.cli.log(`Replacing version file.`);
          this.replaceFile(params.location, message, params.regex)
        }
        else {
          this.serverless.cli.log(`Creating version file.`);
          fs.writeFileSync(params.location, message);
        }
      } 
      else this.serverless.cli.log("Skipping Deployment Tracker");

    }
  }
  
} //class

module.exports = ServerlessPlugin;
