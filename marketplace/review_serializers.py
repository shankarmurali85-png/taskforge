from rest_framework import serializers
from .models import Bid, Review

class ReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Review
        fields = [
            'id',
            'project',
            'reviewer',
            'reviewed_user',
            'rating',
            'comment',
            'created_at',
        ]
        read_only_fields = ['reviewer', 'created_at']

    def validate_rating(self, rating):
        if rating < 1 or rating > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')

        return rating

    def validate(self, attrs):
        request = self.context.get('request')
        project = attrs.get('project')
        reviewed_user = attrs.get('reviewed_user')

        if not request or not project or not reviewed_user:
            return attrs

        reviewer = request.user
        accepted_bid = Bid.objects.filter(
            project=project,
            status='accepted',
        ).select_related('freelancer').first()

        if project.status != 'completed':
            raise serializers.ValidationError(
                'Reviews can only be created after a project is completed.'
            )

        if reviewer == reviewed_user:
            raise serializers.ValidationError(
                'You cannot review yourself.'
            )

        if reviewer not in [project.client, accepted_bid.freelancer if accepted_bid else None]:
            raise serializers.ValidationError(
                'Only the client and the accepted freelancer can review this project.'
            )

        allowed_review_target = (
            accepted_bid.freelancer
            if reviewer == project.client and accepted_bid
            else project.client
        )

        if reviewed_user != allowed_review_target:
            raise serializers.ValidationError(
                'You can only review the other participant in the completed project.'
            )

        if Review.objects.filter(project=project, reviewer=reviewer).exists():
            raise serializers.ValidationError(
                'You have already submitted a review for this project.'
            )

        return attrs
