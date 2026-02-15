spellcheck s:
	@for i in _posts/*.md; do aspell -c $$i; done
	@for i in _drafts/*.md; do aspell -c $$i; done

clean c:
	rm -f _site/*.bak
	rm -f _drafts/*.bak
	rm -f _posts/*.bak

drafts d:
	jekyll server --drafts

future f:
	jekyll server --drafts --future

images i:
	@if [ -z "$(YEAR)" ]; then \
		echo "Usage: make images YEAR=2025"; \
		exit 1; \
	fi
	@echo "Processing images for year $(YEAR)..."
	@cd assets/posts/book-$(YEAR) && \
		# Convert .webp to .png
		for f in *.webp; do \
			[ -e "$$f" ] || continue; \
			out="$${f%.webp}.png"; \
			sips -s format png "$$f" --out "$$out" >/dev/null; \
			if [ -e "$$out" ]; then \
				echo "Deleting $$f after converting to $$out"; \
				rm "$$f"; \
			fi; \
		done && \
		# Resize .jpg, .jpeg, and .png
		for f in *.jpg *.jpeg *.png; do \
			[ -e "$$f" ] || continue; \
			echo "Resizing $$f to width 300"; \
			sips --resampleWidth 300 "$$f" >/dev/null; \
		done