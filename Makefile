spellcheck s:
	@for i in _posts/*.md; do aspell -c $$i; done
	@for i in _drafts/*.md; do aspell -c $$i; done

clean c:
	rm -f _site/*.bak
	rm -f _drafts/*.bak
