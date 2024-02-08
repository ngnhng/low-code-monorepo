'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@measured/puck';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Input,
  FormDescription,
  FormMessage,
} from '@repo/ui';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getExtensionElement } from 'helpers/bpmn.helper';

const qaFormSchema = z.object({
  score: z.coerce.number().min(0).max(100, 'Score must be between 0 and 100'),
  comment: z
    .string()
    .max(100, 'Comment must be less than 100 characters')
    .optional(),
});

export const QAElementProperties = ({ element, modeler }) => {
  const [businessObject, setBusinessObject] = useState<any>(null);
  const [analysisDetails, setAnalysisDetails] = useState<any>(null);
  const [extensionElements, setExtensionElements] = useState<any>(null);
  const moddle = modeler.get('moddle');
  const modeling = modeler.get('modeling');

  useEffect(() => {
    const bObject = getBusinessObject(element);
    //console.log(bObject);
    setBusinessObject(bObject);

    setExtensionElements(
      bObject.extensionElements || moddle.create('bpmn:ExtensionElements'),
    );

    if (getExtensionElement(bObject, 'qa:AnalysisDetails')) {
      setAnalysisDetails(getExtensionElement(bObject, 'qa:AnalysisDetails'));
    }
  }, [element]);

  if (!businessObject) {
    return <div> Error... </div>;
  }

  if (!analysisDetails && extensionElements) {
    const details = moddle.create('qa:AnalysisDetails');
    setAnalysisDetails(details);

    extensionElements.get('values').push(details);
  }

  const onSubmit = (values: z.infer<typeof qaFormSchema>) => {
    console.log('score', values.score);
    modeling.updateProperties(element, {
      extensionElements,
      suitable: Number(values.score),
    });
    if (values.comment && analysisDetails) {
      console.log('comment', values.comment);

      const comments = moddle.create('qa:Comment', {
        text: values.comment,
      });

      analysisDetails.get('comments').push(comments);

      modeling.updateProperties(element, {
        extensionElements,
      });
    }
  };

  return <QAElementForm onSubmit={onSubmit} />;
};

const QAElementForm = ({ onSubmit }) => {
  const form = useForm<z.infer<typeof qaFormSchema>>({
    resolver: zodResolver(qaFormSchema),
    defaultValues: {
      score: 0,
      comment: 'No comment provided.',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <>
              <FormItem>
                <FormLabel>Score</FormLabel>
                <FormControl>
                  <Input placeholder="Enter score" {...field} />
                </FormControl>
                <FormDescription>
                  Score must be between 0 and 100
                </FormDescription>
                <FormMessage />
              </FormItem>
            </>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <>
              <FormItem>
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <Input placeholder="Enter comment" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            </>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
