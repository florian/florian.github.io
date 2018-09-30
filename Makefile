spellcheck:
	@for i in _posts/*.md; do aspell -c $$i; done
	@for i in _drafts/*.md; do aspell -c $$i; done
s: spellcheck
