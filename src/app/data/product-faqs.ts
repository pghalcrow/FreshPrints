export interface FaqItem {
  question: string;
  answer: string;
}

// Answers come from the owner's FAQ responses, lightly edited
export const PRODUCT_FAQS: Record<string, FaqItem[]> = {
  booklets: [
    {
      question: 'How long does it take to print booklets?',
      answer: 'We only accept booklet orders that can be turned around quickly, typically in 1 to 3 days.'
    },
    {
      question: 'How many pages can a saddle-stitched booklet have?',
      answer: 'To stay in line with our emergency printing focus, we prefer a maximum of 16 pages.'
    },
    {
      question: 'Why must the page count be a multiple of 4?',
      answer: 'Booklet sheets are scored and folded in half, so each sheet naturally creates four pages.'
    },
    {
      question: 'Does the cover count toward the page count?',
      answer: 'Yes. The cover counts as four pages: the outside front, inside front, inside back and outside back.'
    },
    {
      question: 'Saddle stitch or perfect binding: which should I choose?',
      answer: 'As an emergency printer, we only offer saddle-stitch binding.'
    }
  ],
  catalogs: [
    {
      question: 'How long does catalog printing take?',
      answer: 'As fast as same day.'
    },
    {
      question: 'What is the minimum page count for a catalog?',
      answer: 'The minimum is four pages.'
    },
    {
      question: 'Can you mail my catalogs?',
      answer: 'We do not offer direct mail to your customers, but we can deliver your catalogs to you in bulk.'
    },
    {
      question: 'What paper and binding options do you offer?',
      answer: 'We offer text-weight papers and select cover weights. Because we are an emergency printer, we keep our paper options limited. We can saddle-stitch catalogs, and edge binding may be possible depending on the page count.'
    }
  ],
  flyers: [
    {
      question: 'How long does it take to print flyers?',
      answer: 'As fast as same day.'
    },
    {
      question: 'What size should flyers be?',
      answer: 'We print standard flyer sizes only.'
    },
    {
      question: 'What paper weight do you use for flyers?',
      answer: 'We print flyers on both text-weight and cover stocks.'
    },
    {
      question: 'Do you offer glossy or matte flyers?',
      answer: 'We offer both glossy and matte finishes.'
    },
    {
      question: 'How many flyers should I print for an event?',
      answer: 'That is entirely up to you.'
    }
  ],
  labels: [
    {
      question: 'How fast can you print labels, and can you rush them?',
      answer: 'Yes, we can rush labels. Turnaround can be as fast as same day.'
    },
    {
      question: 'What is the minimum order for labels?',
      answer: 'There is no minimum order quantity, but there is a $250 minimum charge.'
    },
    {
      question: 'Do you print labels on rolls or sheets?',
      answer: 'Our labels are printed on rolls. If you need individually cut pieces, our stickers are the right fit.'
    },
    {
      question: 'Are your labels waterproof?',
      answer: 'We offer a vinyl label option for labels that need to be waterproof.'
    }
  ],
  packaging: [
    {
      question: 'What is the turnaround for packaging, and do you offer rush?',
      answer: 'Packaging production is highly customized. We can rush packaging, but dies and other tooling typically take time. Even so, we usually beat the turnaround times of most other printers.'
    },
    {
      question: 'What is the minimum order quantity for packaging?',
      answer: 'There is no minimum quantity, but there is a minimum cost based on manufacturing costs. We determine it once we see the scope of the work.'
    },
    {
      question: 'What is a dieline, and can you provide one?',
      answer: 'A dieline is the flat template that shows where your packaging will be cut and folded. We do not create dielines, so you must provide your own.'
    },
    {
      question: 'Can I get a sample first?',
      answer: 'Samples are not part of our rush service. If you need a sample before production, you would be better served by a standard-turnaround printer rather than an emergency printer like Fresh Prints.'
    }
  ],
  postcards: [
    {
      question: 'Do you offer EDDM (Every Door Direct Mail) postcards?',
      answer: 'No. Fresh Prints does not offer EDDM printing or EDDM mailing services.'
    },
    {
      question: 'Can you mail my postcards for me?',
      answer: 'No. We do not offer mailing services. We deliver your finished postcards directly to your business.'
    }
  ],
  sleeves: [
    {
      question: 'What are your lead times for packaging sleeves?',
      answer: 'Approximately 7 working days.'
    },
    {
      question: 'What is the minimum order for packaging sleeves?',
      answer: 'The minimum order is 1,000 sleeves.'
    },
    {
      question: 'What size sleeve fits my box?',
      answer: 'You will need to determine the sleeve size with your design team and supply us with a dieline.'
    },
    {
      question: 'Do you have a sleeve template?',
      answer: 'We print custom sleeves only, so we do not have off-the-shelf sleeve templates.'
    }
  ],
  stickers: [
    {
      question: 'How long do custom stickers take?',
      answer: 'Same day if needed.'
    },
    {
      question: 'Do you offer same-day sticker printing in San Diego?',
      answer: 'Yes.'
    },
    {
      question: 'Do you print vinyl or paper stickers?',
      answer: 'We print both vinyl and paper stickers.'
    },
    {
      question: 'Are your stickers on rolls or sheets?',
      answer: 'Our stickers are individually cut. If you need roll labels, see our label printing.'
    },
    {
      question: 'Are your stickers waterproof?',
      answer: 'Yes. Our vinyl stickers are generally waterproof.'
    },
    {
      question: 'Die-cut vs. kiss-cut: what is the difference?',
      answer: 'Die-cut stickers are cut completely through both the sticker and the paper backing to match the exact shape of your design. Kiss-cut stickers are cut only through the top layer, leaving the paper backing intact so the sticker peels off easily.'
    },
    {
      question: 'What is the minimum order for stickers?',
      answer: 'The minimum order is 250 stickers.'
    }
  ]
};
