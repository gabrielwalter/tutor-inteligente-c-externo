#!/bin/bash

# E-mail de destino
EMAIL="contato@gabrielhando.com"

# Loop infinito com intervalo de 14 minutos
while true; do
  hour=$(date +%H)
  
  # Só executa entre 08h e 22h
  if [ "$hour" -ge 8 ] && [ "$hour" -lt 22 ]; then
    # Verifica status do site
    status=$(curl -s -o /dev/null -w "%{http_code}" https://britney-spears-teaches-you.onrender.com)
    echo "Status em $(date): $status"

    # Se não for 200, envia alerta
    if [ "$status" != "200" ]; then
      (
        echo "Subject: 🚨 Alerta: Render fora do ar"
        echo "To: $EMAIL"
        echo "Content-Type: text/plain; charset=UTF-8"
        echo ""
        echo "O site está fora do ar! Status: $status em $(date)."
      ) | msmtp "$EMAIL"
    fi
  fi

  # Aguarda 14 minutos
  sleep 840
done