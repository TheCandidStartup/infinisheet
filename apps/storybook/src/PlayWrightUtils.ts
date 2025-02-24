// Convert pascal-case story name into lowercase words separated by "-"
function pascalCaseToStorybookUrl(story: string): string {
  const re = /[A-Z]?[a-z]+/g;

	let match = re.exec(story);
  let output = "";
	while (match) {
    if (output)
      output += "-" + match[0].toLowerCase();
    else
      output = match[0].toLowerCase();
		match = re.exec(story);
	}

	return output;
}

// Create URL for accessing a story
export function storyUrl(iframe: boolean, packageName: string, component: string, story: string): string {
  const base = packageName + "-" + component.toLowerCase() + "--" + pascalCaseToStorybookUrl(story);
  return (iframe ? "/iframe.html?id=" : "/?path=/story/") + base;
}

// Convert URL to use test build if available
export function testUrl(url: string): string {
  return (process.env.CI || process.env.PROD) ? "/test" + url : url;
}

