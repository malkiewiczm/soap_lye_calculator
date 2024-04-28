"""This program munges all input files into a single output html file."""
import markdown
import subprocess
import os

def main():
	print('[MUNGE] Running typescript compiler')
	if not run_typescript():
		print('[MUNGE] Could not run typescript compiler, must abort')
		return
	print('[MUNGE] Running closure compiler')
	if not run_closure():
		print('[MUNGE] Could not run closure compiler for some reason. This step will be skipped.')
	out_file_name = 'deploy/index.html'
	print('[MUNGE] Writing', out_file_name)
	with open(out_file_name, 'w') as output:
		dump_preamble(output)
		with open('index.html', 'r') as html_input:
			for line in html_input:
				if 'main.js' in line:
					dump_main_js(output)
				elif 'style.css' in line:
					dump_style_css(output)
				elif 'README' in line:
					dump_readme(output)
				else:
					output.write(line)
	print('[MUNGE] Success')

def run_typescript():
	try:
		result = subprocess.run(['tsc'], shell=True)
		ec = result.returncode
		if ec != 0:
			print('Non zero exit code', ec)
		return ec == 0
	except:
		return False

def run_closure():
	try:
		result = subprocess.run([
			'java', '-jar', 'build/closure-compiler.jar',
			'--compilation_level', 'SIMPLE',
			'--js', 'main.js', '--js_output_file', 'main.out.js'
		])
		ec = result.returncode
		if ec != 0:
			print('Non zero exit code', ec)
		else:
			os.replace('main.out.js', 'main.js')
		return ec == 0
	except:
		return False

def dump_preamble(output):
	dump_file('html_preamble.txt', output)
	output.write('\n')

def dump_readme(output):
	with open('README.md', 'r') as f:
		all_text = f.read()
		output.write(markdown.markdown(all_text))

def dump_style_css(output):
	output.write('<style>\n')
	dump_file('style.css', output)
	output.write('\n</style>\n')

def dump_main_js(output):
	output.write('<script>\n')
	dump_file('main.js', output)
	output.write('</script>\n')

def dump_file(fname, output):
	with open(fname, 'r') as f:
		for line in f:
			output.write(line)

if __name__ == '__main__':
	main()
