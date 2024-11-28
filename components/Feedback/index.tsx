import { useState } from 'react';

import router from 'next/router';

import { Button, Container, Group, Textarea, TextInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

import axios from 'axios';

export function Feedback() {
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData) as {
        name: string;
        contact: string;
        feedback: string;
        page_path: string;
      };

      await axios.post('https://formspree.io/f/xayzroby', data);

      setFeedbackEnabled(false);

      showNotification({
        title: 'Feedback enviado',
        message: 'Obrigado por nos ajudar a melhorar o hinarios.app :)',
      });

      form.reset();
    } catch (error) {
      showNotification({
        title: 'Não foi possível enviar o feedback',
        message: 'Tente novamente mais tarde',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="xs" mt="xl">
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="Encontrou um erro ou tem uma sugestão? Escreva aqui"
          label={feedbackEnabled && 'Feedback'}
          name="feedback"
          onClick={() => setFeedbackEnabled(true)}
          required
          withAsterisk
        />

        {feedbackEnabled && (
          <>
            <TextInput label="Nome (opcional)" placeholder="Seu nome" name="name" />
            <TextInput label="Contato (opcional)" placeholder="E-mail ou WhatsApp" name="contact" />
            <TextInput type="hidden" name="page_path" value={router.asPath} />

            <Group position="right" mt="md">
              <Button type="submit" loading={isSubmitting}>
                Enviar
              </Button>
            </Group>
          </>
        )}
      </form>
    </Container>
  );
}
