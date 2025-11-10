FROM ghcr.io/muchobien/pocketbase:latest


COPY pb_hooks /pb_hooks

EXPOSE 8090

CMD ["serve", "--http", "0.0.0.0:8090"]
