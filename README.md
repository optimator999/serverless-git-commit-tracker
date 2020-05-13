# Serverless Git Commit Tracker
This plugin creates an operating system file containing the current git commit version. It also has the ability to update an existing file with the current git commit version.

# Getting Started

### 1. Install the plugin
```
npm install serverless-git-commit-tracker --save-dev
``` 

### 2. Add the plugin to your serverless.yml file
```
plugins:
  - serverless-git-commit-tracker
  
 custom:
   gitCommitTracker:
     location: ./version.txt
```
 
 The `location` key tells Git Commit Tracker where it should write the file.
 
Now, when you deploy your project a new file will be created with the current git commit version. Note: This file is created after you commit to git so the newly created file will not be part of the referenced git commit.
 
# Additional Directives
 
### Deployment
```
 custom:
   gitCommitTracker:
 	location: ./version.txt
 	deployment:
 	  - dev
 	  - production
 	  - qa
```

Without the `deployment` directive the version file is created for every deployment. With the `deployment` directive the version file is created only for deployments matching the list following the directive. For example, `sls deploy --stage production` will result in the version file being created. However, `sls deploy --stage test` will NOT create the version file.

### HTML

```
custom:
	deploymentTracker:
	  location: ./version.txt
	  deployment:
		- dev
		- production
		- qa
	  html: true
```
The default behavior is to create a text file with line feeds. However, the `html` directive replaces the line feeds with html `<br/>` elements.

### REGEX
```
custom:
	deploymentTracker:
	  location: ./version.txt
	  deployment:
		- dev
		- production
		- qa
	  html: true
	  regex: '(<span>).*(<\/span>)'
```
The `regex` directive allows you to replace a stub in an *existing* file. This is useful if you have an HTML file and you want to only update a given section with the version information. The regex expression uses backreferences to keep the beginning and ending markers in the file for replacement next time. Therefore, the regex expression must contain parentheses around both the beginning and ending markers. In the above example, the `<span>` elements will be used as the markers.

# Commands

### gitTrackerCreate
It is also possible to create the version file using a command: `sls gitTrackerCreate` will create the same file as deployment would have created.

###gitVersion
`sls getCommitVersion` will return the current git commit version on the command line

