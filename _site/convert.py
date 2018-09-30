content = open("./_drafts/estimators.md", "rb").read()

result = u""
first = True

for ordc in content:
    char = chr(ordc)

    if char == "$":
    	if first:
            result += "\\\\("
            first = False
    	else:
            result += "\\\\)"
            first = True
    else:
    	result += char

result = result.replace("\\[", "\n$$")
result = result.replace("\\]", "$$\n")

result = result.replace("\\begin{equation}", "\n$$")
result = result.replace("\\end{equation}", "$$\n")

result = result.replace("\\begin{itemize}", "\n")
result = result.replace("\\end{itemize}", "\n")
result = result.replace("\t\\item", "-")
result = result.replace("\\item", "-")

result = result.replace("\\noindent ", "")

open("./_drafts/estimators2.md", "wb").write(bytearray(result, "utf8"))
